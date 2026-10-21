using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class telefono
{
    public int numero { get; set; }

    public string? id_usuario { get; set; }

    public string? id_empresa { get; set; }

    public virtual empresa? id_empresaNavigation { get; set; }

    public virtual usuario? id_usuarioNavigation { get; set; }
}
